import { StatusCodes } from 'http-status-codes'

export const uploadGeoJsonFile = async (req, res) => {
 
  //upload a GeoJson file to the public folder
  console.log(req.files)

  let myFile = req.files.myFile
  let myFilePath = new URL ('../public/uploads/'+`${myFile.name}`, import.meta.url).pathname.slice(1)

  await myFile.mv(myFilePath)

  return res.status(StatusCodes.OK)
    .json(
      {uploadedFile: {src: `/uploads/${myFile.name}`}}
    )

}