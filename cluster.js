const os = require('os');
const cluster = require('cluster');
const numofCups = os.cpus().length;
const port = process.env.PORT || 5000;

module.exports = (app) => {
 if(cluster.ismaster){
  for(let i= 0; i< numofCups ;i++){
      cluster.fork();
  }
  cluster.on('exit', (worker, code, sginal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
  })
}
else{
    app.listen(port,() => {
    console.log(`listen server PID - ${process.pid} PORT - `, port);
});
}
}
// Cluster making for 
