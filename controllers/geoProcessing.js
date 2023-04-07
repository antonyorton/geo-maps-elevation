import fs from 'fs'
import proj4 from 'proj4'
import * as turf from '@turf/turf'
import {Client} from '@googlemaps/google-maps-services-js'


//epsg.io/7856.proj4
const epsg_strings_proj4 = {
  '4326': '+proj=longlat +datum=WGS84 +no_defs +type=crs',
  '7855': '+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  '7856': '+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
}

export const projectToLatLong = async(req, res) => {
  //read geojson file in the public folder and reproject coords to lat/long

  //TODO ERROR CHECKING:
  // 1. must check it is a geojson file

  //read input data
  let data = await readFile(req.body.fileName)

  //project to lat/long
  let newData = await dataToLatLong(data)

  //send processed data to client
  res.json(newData)

}

export const getElevation = async (req, res) => {
  
  //activate the google maps node-js client
  const client = new Client({})

  //read input file
  let data = await readFile(req.body.fileName)
  //project from current coords to lat/long (epsg:4326)
  data = await dataToLatLong(data)
  
  //extract coords
  let coords = data.features[0].geometry.coordinates[0]
  
  // split coords lineString into num_points equally spaced points
  let splitCoords = await splitLine(coords, {num_points: 30})
  coords = splitCoords.map(item => { return {lat: parseFloat(item[1].toFixed(4)), lng: parseFloat(item[0].toFixed(4))} })
  let chainage = splitCoords.map(item => item[2])

  //get elevations along line from Google Maps API
  let elevations = await client.elevation({
    params: {
      locations: coords,
      key: process.env.GMAPS_API_KEY,
    },
    timeout: 1500, // milliseconds
  })
  elevations = elevations.data.results
  
  //add chainage
  elevations = elevations.map((item, ival) => {
    return {chainage: parseFloat(chainage[ival].toFixed(1)), elevation: parseFloat(item['elevation'].toFixed(2)), location: item.location}
  })

  res.json(elevations)
}


async function readFile(fileName) {
  const filePath = new URL ('../public/uploads/'+`${fileName}`, import.meta.url).pathname.slice(1)
  let data = await fs.promises.readFile(filePath,'utf-8')
  data = JSON.parse(data)
  return data
}

async function dataToLatLong(data) {
    //data is a geojson object

    //get input data epsg code
    let epsg_code = data.crs.properties.name
    epsg_code = epsg_code.slice(epsg_code.length - 4, epsg_code.length)

    //extract coords
    let coords = data.features[0].geometry.coordinates[0]
    
    //project coords from input epsg to lat/lon
    let coordsProj = coords.map(item =>
      proj4(epsg_strings_proj4[epsg_code],epsg_strings_proj4['4326'],item))
    
    //create new object
    let newData = JSON.parse(JSON.stringify(data))
    newData.features[0].geometry.coordinates[0] = coordsProj
    newData.crs.properties.name = 'urn:ogc:def:crs:EPSG::4326' //re-label the crs properties name

    return newData

}

async function fetchEpsgString(epsg_number) {
  //fetch epsg proj4 string from web (if required), epsg_number: number for example 7856, 7855, 4326
  let code = await fetch(`https://epsg.io/${epsg_number}.proj4`)
  return code.text()
}

async function splitLine(data, {num_points=10}) {
  //data is an array [[lat, lng],[lat,lng]...]
  //returns array [[lng, lat, chain],[...],[...]]

  let line = turf.lineString(data)
  let distOptions = {units: 'meters'}
  let length = turf.length(line, distOptions)
  let spacing = length / (num_points - 1)

  let output = []
  let temp = []
  for (let i = 0; i < num_points; i++) {
    temp = turf.getCoords(turf.along(line,i * spacing,distOptions))
    temp.push(i * spacing)
    output.push(temp)
  } 
  
  return output
}

