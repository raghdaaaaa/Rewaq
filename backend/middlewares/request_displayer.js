let num = 1;
module.exports = (req, res, next) => {
    console.log(`\nREQ #${num++}`)
    console.log(`URL:        ${req.protocol}://${req.get("host")}${req.originalUrl}`)
    console.log(`METHOD:     ${req.method}`);
    console.log(`=================================================`);
    next();
};