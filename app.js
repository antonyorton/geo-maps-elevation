import 'dotenv/config';
import 'express-async-errors';
import router from './routes/routes.js';
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors({origin: 'http://localhost:5000'}))

import fileUpload from 'express-fileupload' //required to read file upload request.body

// // error handler
// import notFoundMiddleware from './middleware/not-found.js';
// import errorHandlerMiddleware from './middleware/error-handler.js';

app.set('view engine','ejs') //template engine
app.use('/api/v1/', express.static('./public')) //public folder to serve static files
app.use('/api/v1/process/', express.static('./public')) //public folder to serve static files

//json middleware
app.use(express.json())
//req body processing middleware
app.use(express.urlencoded({ extended: true }))
//fileupload middleware
app.use(fileUpload({useTempFiles: true}))

app.get('/', (req, res) => {
  res.send('Welcome to the google maps testing app. This is not fully working yet.');
});

//root path
app.use('/api/v1/', router)

// // middleware
// app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

//server listening
app.listen(port,console.log(`Server is listening on port ${port}....`))