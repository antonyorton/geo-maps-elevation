import express from 'express'
import { uploadGeoJsonFile } from '../controllers/fileUpload.js'
import { welcome, listAllFiles } from '../controllers/views.js'
import { projectToLatLong, getElevation } from '../controllers/geoProcessing.js'

const router = express.Router()

router.route('/').get(welcome)
router.route('/listfiles').get(listAllFiles)
router.route('/upload').post(uploadGeoJsonFile)
router.route('/process/project').post(projectToLatLong)
router.route('/process/getelev').post(getElevation)

export default router

