import fs from 'fs'

export const welcome = async(req, res) => {
  res.send('Welcome to the index page')
}

export const listAllFiles = async (req, res) => {
  
  const myFiles = await fs.promises.readdir('./public/uploads/')
  myFiles.map(item => console.log(item))

  res.json(myFiles)
}