const localStratergy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,getUserByEmail,getUserById){    
    const authenticateUser = async (email,password,done)=>{
        const user = await getUserByEmail(email)
        if(user == null){
            return done(null, false , {message: "No user With This Email"})
        }

        try{
            if( await bcrypt.compare(password , user.user_password)){
            return done(null,user)
            }else{
                return done(null,false,{message: "Incorrect Password"})
            }
        }catch(e){
            done(e)
        }
    }

    passport.use(new localStratergy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user,done)=>done(null,user.user_id))
    
    passport.deserializeUser((id,done)=>{
       return done(null,getUserById(id))
    })
}
module.exports = initialize
