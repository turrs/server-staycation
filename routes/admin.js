var express = require("express");
const auth = require("../middlewares/auth");
const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { uploadSingle, uploadMultiple } = require("../middlewares/multer");

router.get("/signin", adminController.viewSignin);
router.post("/signin", adminController.actionSignin);
router.use(auth);
router.get("/logout", adminController.actionLogout);
router.get("/dashboard", adminController.viewDashboard);
// endpoint category
router.get("/category", adminController.viewCategory);
router.post("/category", adminController.addCategory);
router.put("/category", adminController.editCategory);
router.delete("/category/:id", adminController.deleteCategory);
// endpoint bank
router.get("/bank", adminController.viewBank);
router.post("/bank", uploadSingle, adminController.addBank);
router.put("/bank", uploadSingle, adminController.editBank);
router.delete("/bank/:id", adminController.deleteBank);
// endpoint item
router.get("/item", adminController.viewItem);
router.get("/item/:id", adminController.editItem);
router.post("/item", uploadMultiple, adminController.addItem);
router.put("/item/:id", uploadMultiple, adminController.updateItem);
router.post("/item/activity", uploadSingle, adminController.addActivityItem);
router.delete("/item/:itemId/activity/:id", adminController.deleteActivity);
router.post("/item/feature", uploadSingle, adminController.addFeatureItem);
router.delete("/item/:itemId/feature/:id", adminController.deleteFeature);
// endpoint booking
router.get("/booking", adminController.viewBooking);
router.get("/booking/:id", adminController.showDetailBooking);
router.put("/booking/:id/confirmation", adminController.actionConfirmation);
router.put("/booking/:id/reject", adminController.actionReject);
module.exports = router;
