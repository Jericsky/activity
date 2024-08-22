//[SECTION] Activity: Dependencies and Modules
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment= require("../models/Enrollment");
const { errorHandler } = require("../auth");
//[SECTION] Activity: Create a course
/*
    Steps: 
    1. Instantiate a new object using the Course model and the request body data
    2. Save the record in the database using the mongoose method "save"
    3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/

//try-catch
/*
module.exports.addCourse = (req, res) => {

    try {
            let newCourse = new Course({
            name : req.body.name,
            description : req.body.description,
            price : req.body.price
        });

        return newCourse.save()
        .then(result => res.send(result))
        .catch(err => res.send(err))
    } catch (err) {
        res.send("Error in Variables");
    }

    
}; 
*/

module.exports.addCourse = (req, res) => {


    let newCourse = new Course({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

    Course.findOne({name: req.body.name}).then(existingCourse => {
        if(existingCourse){
            return res.status(409).send({message: 'Course already exists'});
        }
        else{
            return newCourse.save()
            .then(result => res.status(201).send({
                success: true,
                message: 'Course added successfully',
                result: result
            }))
            .catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res));    
  
}; 


//[SECTION] Activity: Retrieve all courses
/*
    Steps: 
    1. Retrieve all courses using the mongoose "find" method
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllCourses = (req, res) => {
    return Course.find({})
    .then(result => {
        // if the result is not null send status 30 and its result
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            // 404 for not found courses
            return res.status(404).send({message: 'No courses found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Retrieve all active courses
/*
    Steps: 
    1. Retrieve all courses using the mongoose "find" method with the "isActive" field values equal to "true"
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllActive = (req, res) => {

    Course.find({ isActive: true })
    .then(result => {

        // if the result is not empty, it means the process is OK/successfull and able to retrieve courses
        if(result.length > 0){
            return res.status(200).send(result)
        }
        else{ 
            // if it does not found an active course, it should response 404, meaning NOT FOUND. 
            return res.status(404).send({ message: 'No active courses found' });
            // return res.status(404).send("No active course found")
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// SHORT BREAK: Be back at 2:00 PM

//[SECTION] Retrieve a specific course
/*
    Steps: 
    1. Retrieve a course using the mongoose "findById" method
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getCourse = (req, res) => {
    Course.findById(req.params.id)
    .then(course => {
        if(course) {
            return res.status(200).send(course);
        } else {
            return res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

//[SECTION] Update a course
/*
    Steps: 
    1. Create an object containing the data from the request body
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.updateCourse = (req, res)=>{

    let updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Course.findByIdAndUpdate(req.params.courseId, updatedCourse)
    .then(course => {
        if (course) {
            res.status(200).send({ success: true, message: 'Course updated successfully' });
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Archive a course
/*
    Steps: 
    1. Create an object and with the keys to be updated in the record
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. If a course is updated send a response of "true" else send "false"
    4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.archiveCourse = (req, res) => {
  
    let updateActiveField = {
        isActive: false
    };

    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            // Check if a course was found
            if (course) {
                // If course found, check if it was already archived
                if (!course.isActive) {
                    // If course already archived, return a 200 status with a message indicating "Course already archived".
                    return res.status(200).send({ 
                        message: 'Course already archived',
                        course: course
                        });
                }
                // If course not archived, return a 200 status with a boolean true.
                return res.status(200).send({ 
                            success: true, 
                            message: 'Course archived successfully'
                        });
            } else {
                // If course not found, return a 404 status with a boolean false.
                return res.status(404).send({ message: 'Course not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};


//[SECTION] Activate a course
/*
    Steps: 
    1. Create an object and with the keys to be updated in the record
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. If the user is an admin, update a course else send a response of "false"
    4. If a course is updated send a response of "true" else send "false"
    5. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.activateCourse = (req, res) => {
  
    let updateActiveField = {
        isActive: true
    }

    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            // Check if a course was found
            if (course) {
                // If course found, check if it was already activated
                if (course.isActive) {
                    // If course already activated, return a 200 status with a message indicating "Course already activated".
                    return res.status(200).send({ 
                        message: 'Course already activated', 
                        course: course
                    });
                }
                // If course not yet activated, return a 200 status with a boolean true.
                return res.status(200).send({
                    success: true,
                    message: 'Course activated successfully'
                });
            } else {
                // If course not found, return a 404 status with a boolean false.
                return res.status(404).send({ message: 'Course not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};


module.exports.searchCoursesByName = async (req, res) => {
    try {
        const { courseName } = req.body;
    
        // Use a regular expression to perform a case-insensitive search
        const courses = await Course.find({
        name: { $regex: courseName, $options: 'i' }
        });
    
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getEmailsOfEnrolledUsers = async (req, res) => {
    const courseId = req.params.courseId;

    try {
            // Find enrollments by courseId
            const enrollments = await Enrollment.find({ 'enrolledCourses.courseId': courseId });
    if (!enrollments.length) {
                return res.status(404).json({ message: 'Enrollment not found' });
            }
    // Get the userIds of enrolled users from the enrollments
            const userIds = enrollments.map(enrollment => enrollment.userId);
    // Find the users with matching userIds
            const enrolledUsers = await User.find({ _id: { $in: userIds } });
    // Extract the emails from the enrolled users
            const emails = enrolledUsers.map(user => user.email);
    res.status(200).json({ userEmails: emails });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while retrieving enrolled users' });
        }
};