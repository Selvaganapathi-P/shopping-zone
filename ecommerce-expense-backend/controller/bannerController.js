const Banner = require("../model/bannerModel");

const getBanner = async (req, res) => {
  try {
    let banner = await Banner.findOne({ isActive: true });
    if (!banner) banner = await Banner.create({});
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findOne({});
    if (!banner) banner = new Banner();
    Object.assign(banner, req.body);
    await banner.save();
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getBanner, updateBanner };
