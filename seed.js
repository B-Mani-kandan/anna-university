const mongoose = require('mongoose');
const colledge =require('./models/colledge')

mongoose.connect('mongodb://localhost:27017/anna', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


    // const seeddb=async()=>{
    //        await colledge.deleteMany({})
        
    //        const camp = new colledge({
    //         img:'https://source.unsplash.com/random',
    //         NameoftheCollege:'Measi Academy of Architecture',
    //         Address:`No.87, Peters Road, New College Campus,
    //         Royapettah, Chennai - 600014`,
    //         NameofthePrincipal:'Dr.Monsingh David Devadas',
    //         PhoneNumber:'044-28350445, 28351126',
    //         location:'r.Monsingh David Devadas',
    //         FaxNumber : 044 - 42085184,
    //         WebSite :'www.measi.com',
    //         EmailID: 'example.com',
    //         YearofEstablishment:'1999',
    //         Type:'Self financing',
    //         MinorityStatus:'Muslim Minority',
    //         ExistingCourses:['Architecture',
    //            'Architecture'],
    //         author:'6072d1571f871d30dc5f8cbe'
    //        })
           
    //         await camp.save();
    // }
            
    const seeddb=async()=>{
        await colledge.deleteMany({})
 }   
            
    
    
    seeddb().then(()=>{
        mongoose.connection.close()
    })