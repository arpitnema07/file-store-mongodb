# File-Store-Mongodb

## Having problem sending files from one device to another use our website😁

I am using this app as a medium transfer files from my phone to laptop or vice-versa. I can upload file from my device and download it wherever I need. Best part I can delete the file when I no longer need it.

## Store any Files Type Online, Delete When not needed

![fb971e02e0f30ba0206809f7e51f8ae9](https://user-images.githubusercontent.com/53327946/191242627-eecbe5bd-498c-4a76-a706-7ca6735838f2.jpg)

- Project Uses MongoDB as Storage database to store files
- ejs is used as view engine

## Routes

### "/" GET Route

- Arguments : No Arguments
- Return : Renders a ejs page with basic UI design to show the usage of the API.
  Here you can upload, delete as well as download the files.
  It Loads data from the mongo database and displays all the files uploaded in the database, these file are public for now and anyone who visits the site can see, delete and download them

### "/upload" POST Route

- Arguments : "file" takes a multipart data of any type
- Return : file Object with details such as \_id, filename, size etc.
- This is the main route of the App, using this route you can upload any file of any type on the server and store it to use wherever you want.

### "/files" GET Route

- Arguments : No Arguments
- Return : List of files uploaded in the database.
- This Route is helpful to get all the uploaded file on the database

### Work in Progress...
