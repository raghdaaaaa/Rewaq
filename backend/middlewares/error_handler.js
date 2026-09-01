module.exports = (error, req, res, next) => {
    res.status(error.status || 500).json({
        msg: "Error middleware",
        error_name: error.name,
        error_message: error.message
    });
};