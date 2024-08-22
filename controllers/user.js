const bcrypt = require('bcrypt');

const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

const auth = require("../auth");
const { errorHandler } = auth;

//[SECTION] Check if the email already exists

/*

MINI ACTIVITY

Update the “checkEmailExists” to add status codes
- if there is a duplicate email, send true with 409 http status back to the client
- if there is no duplicate email, send false with 404 http status back to the client
- if an error occured in the .catch(), send the error with the 500 http status back to the client

*/
module.exports.checkEmailExists = (req, res) => {

    if(req.body.email.includes("@")){
        return User.find({ email : req.body.email })
        .then(result => {

            // if there is a duplicate email (email exists)
            if (result.length > 0) {
                return res.status(409).send({message: "Duplicate email found"});
            } else { // if there is no duplicate email
                return res.status(404).send({message: "No duplicate email found"});
            };
        })
        .catch(error => errorHandler(error, req, res));
    }
    else{
        res.status(400).send({message: "Invalid email format"}); // false - Invalid email
    }
};


//[SECTION] User registration
module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Invalid email format' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

//[SECTION] User authentication
module.exports.loginUser = (req, res) => {
    if(req.body.email.includes("@")){
        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({ message: 'No email found' });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({ 
                        message: 'User logged in successfully',
                        access : auth.createAccessToken(result)
                        })
                } else {
                    return res.status(401).send({ message: 'Incorrect email or password' });
                }
            }
        })
         .catch(error => errorHandler(error, req, res));
    }
    else{
        return res.status(400).send({ message: 'Invalid email format' });
    }
};








//[Section] Activity: Retrieve user details
/*
    Steps:
    1. Retrieve the user document using it's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(403).send({ message: 'invalid signature' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.enroll = (req, res) => {

    // user's id from the decoded token after verify()
    console.log("user token's id")
    console.log(req.user.id);

    // enrolled courses of the user from the request body
    console.log(req.body.enrolledCourses);

    if(req.user.isAdmin){
        return res.status(403).send({ message: 'Admin is forbidden' });
    }

    let newEnrollment = new Enrollment({
        userId: req.user.id,
        enrolledCourses: req.body.enrolledCourses,
        totalPrice: req.body.totalPrice
    });


    return newEnrollment.save().then(enrolled =>{
        return res.status(201).send({
            success: true,
            message: 'Enrolled successfully'
        });
    })
    .catch(error => errorHandler(error, req, res));

}

//[SECTION] Activity: Get enrollments
/*
    Steps:
    1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
    2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record
*/
module.exports.getEnrollments = (req, res) => {
    return Enrollment.find({userId : req.user.id})
        .then(enrollments => {
            if (enrollments.length > 0) {
                return res.status(200).send(enrollments);
            }
            return res.status(404).send({
                message: 'No enrolled courses'
            });
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}


