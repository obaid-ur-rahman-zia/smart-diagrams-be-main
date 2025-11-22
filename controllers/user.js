const User = require("../models/user");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { generateToken } = require("../auth/jwt");

const getAccessToken = async (code) => {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: "https://smart-diagrams-be.onrender.com/api/linkedin/callback", // Must match exactly
    });

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn token error:', errorText);
        throw new Error(`LinkedIn token request failed: ${response.status}`);
    }

    return await response.json();
};

const getUserData = async (accessToken) => {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn user data error:', errorText);
        throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    return await response.json();
};

const linkedInCallback = async (req, res) => {
    try {
        const { code } = req.query; // Get code from query params
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: "No authorization code provided",
            });
        }

        console.log('Processing LinkedIn code:', code);
        
        // Exchange code for access token
        const accessTokenData = await getAccessToken(code);
        
        if (!accessTokenData.access_token) {
            return res.status(400).json({
                success: false,
                error: "No access token received from LinkedIn",
            });
        }

        // Get user data from LinkedIn
        const userData = await getUserData(accessTokenData.access_token);
        
        if (!userData || !userData.email) {
            return res.status(500).json({
                success: false,
                error: "Unable to fetch user data from LinkedIn",
            });
        }

        // Find or create user
        let user = await User.findOne({ email: userData.email });

        if (!user) {
            user = new User({
                name: userData.name,
                email: userData.email,
                avatar: userData?.picture,
            });
            await user.save();
        }

        // Generate JWT token
        const token = generateToken({ 
            id: user._id,
            name: user.name, 
            email: user.email, 
            avatar: user.avatar 
        });

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Redirect to frontend with token in URL (for fallback)
        res.redirect(`https://smart-diagram.vercel.app/dashboard?token=${token}`);

    } catch (error) {
        console.error('LinkedIn callback error:', error);
        // Redirect to login page with error
        res.redirect('https://smart-diagram.vercel.app/login?error=auth_failed');
    }
};

const getUser = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "No token provided",
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid token",
        });
    }
};

module.exports = {
    linkedInCallback,
    getUser,
};