const express = require("express");
const passport = require("passport");
const userController = require("../controllers/user");
const { verify, isLoggedIn } = require("../auth");

const router = express.Router();

router.post("/check-email", userController.checkEmailExists);

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.post("/details",verify, userController.getProfile);

router.post("/enroll", verify, userController.enroll);

router.get('/get-enrollments', verify, userController.getEnrollments);


//Google Login
router.get('/google',
		passport.authenticate('google', {
			scope: ['email', 'profile'],
			prompt: "select_account"
		}	
	));


//Callback for Google OAuth authentication
router.get('/google/callback',
		passport.authenticate('google', {
			failureRedirect: '/users/failed',
		}),
		function (req, res) {
			res.redirect('/users/success')
		}
	);


//Route for failed Google Oauth 
router.get('/failed', (req, res) => {
	console.log('User is not authenticated');
	res.send("Failed")
})

//Route for success
router.get('/success', isLoggedIn, (req, res) => {
	console.log('You are logged in')
	console.log(req.user)
	res.send(`Welcome ${req.user.displayName}`)
})


//Google Logout
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Error while destroying session:", err);
		} else {
			req.logout(() => {
				console.log('You are logged out');
				res.redirect('/')
			})
		}
	})
})


router.put('/reset-password', verify, userController.resetPassword);

//Mini Activities
router.put('/profile', verify, userController.updateProfile);




module.exports = router;