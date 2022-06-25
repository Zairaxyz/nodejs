const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).render('login', {
                message_login_need: 'you need email and password.'
            })
        }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results);

        if (!results || !(await bcrypt.compare(password, results[0].password)))
        res.status(401).render('login', {
            message_login_wrong: 'The email or password wrong'
        }) 

        else {
            const id = results[0].id;
            const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE_IN
            });
            const cookieOptions = {
                expires: new date (
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60  * 60 * 1000 
                ),
                httponly: true,  
            }
            res.cookie('jwt', token, cookieOptions);
            res.status(200).redirect("/home")
        }
    })

    } catch (error) {
        console.log(error);
    }
}
   
exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;
    
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if( results.length > 0 ) {
            return res.render('register', { message_email: 'That email is already in use' })
        } else if ( password !== passwordConfirm ) { 
            return res.render('register', { message_password: 'Passwords do not match'})
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', { name: name , email: email, password: hashedPassword }, (error, results) => {
            if(error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', { message_register: 'register success' })
            }
       })
    });
}