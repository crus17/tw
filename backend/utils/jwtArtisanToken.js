const sendArtisanToken = (artisan, statusCode, res) => {
  // Create JWT cookie
  const token = artisan.getJwtToken();

  //Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    artisan,
  });
};

module.exports = sendArtisanToken;
