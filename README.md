# backend-movies-imdb


This project was bootstrapped with express and nodejs

## To setup and run project

In the project directory, you can run:

### `npm install`
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser/ Postman(testing).

### Deployment

This is deployed on heroku auto deploy with github

### Functionlity

1. Fetch movies data as guest user - without auth
2. You can filter data based on genre type 
3. You can sort data based on - createdAt(By default) , title, director name, reelease year, rating .[Make use of ascending /descending button given side of select to sort a/c]- use clear button to reste search of filter or sorting
4. You can search movies name or director name to get movies
5. You will be able to view details page as guest user / logged user
6. login / Singup/logut functional(JWT token)
7. To add movies / edit/ delete/ uodate you must be loggedin (added aws s3 bucket support for fast rendering of images )
8. You will be only able to edit or change or delete your data not other's added 
9. As loged in user or guest user you can add or remove watch later list
10. We stored images in mongodb in buffer but it was fecthing slow so we reduces the fetch timeby using aws s3 bucket

### `Also added the cluster for api request call`
