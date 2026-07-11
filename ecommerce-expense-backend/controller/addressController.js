const Address = require("../model/addressModel");

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addAddress = async (req, res) => {
  try {
    const { label, name, phone, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = req.body;
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "Required fields missing." });
    }
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({
      userId: req.user._id,
      label: label || "Home",
      name, phone, addressLine1, addressLine2: addressLine2 || "",
      city, state, pincode, landmark: landmark || "",
      isDefault: isDefault || false,
    });
    res.status(201).json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: "Address not found." });
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }
    Object.assign(address, req.body);
    await address.save();
    res.json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteAddress = async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Address deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const setDefault = async (req, res) => {
  try {
    await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: "Address not found." });
    res.json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefault };
