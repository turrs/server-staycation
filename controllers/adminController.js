const Category = require("../models/Category");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Bank = require("../models/Bank");
const Users = require("../models/Users");
const path = require("path");
const fs = require("fs-extra");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const Activity = require("../models/Activity");
const Feature = require("../models/Feature");
const bcrypt = require("bcryptjs");
module.exports = {
  viewDashboard: async (req, res) => {
    try {
      const member = await Member.find();
      const booking = await Booking.find();
      const item = await Item.find();
      res.render("admin/dashboard/view_dashboard", {
        title: "Staycation | Dashboard",
        user: req.session.user,
        member,
        booking,
        item,
      });
    } catch (error) {
      res.redirect("/admin/dashboard");
    }
  },
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      if (req.session.user == null || req.session.user == undefined) {
        res.render("index", {
          alert,
          title: "Staycation | Login",
        });
      } else {
        res.redirect("/admin/dashboard");
      }
      res.render("index", {
        alert,
        title: "Staycation | Login",
      });
    } catch (error) {
      res.redirect("/admin/signin");
    }
  },
  actionLogout: async (req, res) => {
    req.session.destroy();
    res.redirect("admin/signin");
  },
  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Users.findOne({ username: username });
      if (!user) {
        req.flash("alertMessage", "User yang anda masukan tidak ada!!");
        req.flash("alertStatus", "danger");
        console.log("gak ada id");
        res.redirect("/admin/signin");
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash("alertMessage", "Password yang anda masukan tidak cocok!!");
        req.flash("alertStatus", "danger");
        console.log("gak ada pass");
        res.redirect("/admin/signin");
      }
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      console.log("ni sukses");
      res.redirect("/admin/dashboard");
    } catch (error) {
      res.redirect("/admin/signin");
      console.log("ni error");
      console.log(error);
    }
  },

  viewCategory: async (req, res) => {
    try {
      const category = await Category.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      res.render("admin/category/view_category", {
        category,
        alert,
        title: "Staycation | Category",
        user: req.session.user,
      });
    } catch (error) {
      res.redirect("/admin/category");
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body;

      await Category.create({ name });
      req.flash("alertMessage", "Success Add Category");
      req.flash("alertStatus", "success");
      res.redirect("/admin/category");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/category");
    }
  },

  deleteCategory: async (req, res) => {
    const { id, name } = req.params;
    const category = await Category.findOne({ _id: id });
    console.log(category);

    await category.remove();
    res.redirect("/admin/category");
  },
  editCategory: async (req, res) => {
    const { id, name } = req.body;
    const category = await Category.findOne({ _id: id });
    console.log(category);
    category.name = name;

    await category.save();
    res.redirect("/admin/category");
  },
  viewBank: async (req, res) => {
    const bank = await Bank.find();
    console.log(bank);
    res.render("admin/bank/view_bank", {
      category,
      alert,
      title: "Staycation | Bank",
      user: req.session.user,
      bank,
    });
  },
  addBank: async (req, res) => {
    try {
      const { name, nameBank, nomorRekening } = req.body;

      await Bank.create({
        name,
        nameBank,
        nomorRekening,
        imageUrl: `images/${req.file.filename}`,
      });
      res.redirect("/admin/bank");
    } catch {
      res.redirect("/admin/bank");
    }
  },
  deleteBank: async (req, res) => {
    const { id, name } = req.params;
    const bank = await Bank.findOne({ _id: id });

    await bank.remove();
    res.redirect("/admin/bank");
  },
  editBank: async (req, res) => {
    try {
      const { id, name, nameBank, nomorRekening } = req.body;
      const bank = await Bank.findOne({ _id: id });
      if (req.file == undefined) {
        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        await bank.save();
        res.redirect("/admin/bank");
      } else {
        await fs.unlinkSync(path.join(`public/${bank.imageUrl}`));
        bank.name = name;
        bank.nameBank = nameBank;
        bank.nomorRekening = nomorRekening;
        bank.imageUrl = `images/${req.file.filename}`;
        await bank.save();
        res.redirect("/admin/bank");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/bank");
    }
  },
  viewItem: async (req, res) => {
    const item = await Item.find();
    const category = await Category.find();
    res.render("admin/item/view_item", {
      title: "Staycation | Dashboard",
      user: req.session.user,
      category,
      item,
    });
  },
  editItem: async (req, res) => {
    const { id, itemId } = req.params;
    try {
      const category = await Category.find();
      const item = await Item.findOne({ _id: id });
      const categoryName = await Category.findOne({ _id: item.categoryId });
      const activity = await Activity.find({ id: itemId });
      const feature = await Feature.find({ id: itemId });
      console.log(activity);
      const itemDelete = item._id;
      console.log(itemDelete);
      res.render("admin/item/edit_item", {
        item,
        category,
        categoryName,
        activity,
        feature,
        itemDelete,
      });
    } catch (error) {
      console.log(error);
    }
  },
  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, title, price, city, about } = req.body;
      const item = await Item.findOne({ _id: id })
        .populate({ path: "imageId", select: "id imageUrl" })
        .populate({ path: "categoryId", select: "id name" });

      if (req.files.length > 0) {
        for (let i = 0; i < item.imageId.length; i++) {
          const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });
          await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
          imageUpdate.imageUrl = `images/${req.files[i].filename}`;
          await imageUpdate.save();
        }
        item.title = title;
        item.price = price;
        item.city = city;
        item.description = about;
        item.categoryId = categoryId;
        await item.save();

        res.redirect("/admin/item");
      } else {
        item.title = title;
        item.price = price;
        item.city = city;
        item.description = about;
        item.categoryId = categoryId;
        await item.save();

        res.redirect("/admin/item");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/item");
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;
    console.log(id);
    console.log(itemId);
    try {
      const activity = await Activity.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId }).populate("activityId");
      for (let i = 0; i < item.activityId.length; i++) {
        if (item.activityId[i]._id.toString() === activity._id.toString()) {
          item.activityId.pull({ _id: activity._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${activity.imageUrl}`));
      await activity.remove();

      res.redirect(`/admin/item/${itemId}`);
    } catch (error) {
      console.log(error);
      res.redirect(`/admin/item/${itemId}`);
    }
  },
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;
    console.log(id);
    try {
      const feature = await Feature.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId });
      for (let i = 0; i < item.featureId.length; i++) {
        if (item.featureId[i]._id.toString() === feature._id.toString()) {
          item.featureId.pull({ _id: feature._id });
          await item.save();
        }
      }
      await fs.unlink(path.join(`public/${feature.imageUrl}`));
      await feature.remove();
      res.redirect("/admin/item/");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/item/");
    }
  },
  addActivityItem: async (req, res) => {
    const { itemId, name, type } = req.body;
    try {
      console.log(itemId);
      const id = itemId;
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const item = await Item.findOne({ _itemId: id });
      console.log(item);
      item.activityId.push({ _id: activity._id });
      console.log(item.activityId);
      await item.save();
      res.redirect("/admin/item/");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/item/");
    }
  },
  addFeatureItem: async (req, res) => {
    try {
      const { itemId, name, qty } = req.body;
      console.log(itemId);
      const id = itemId;
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      });

      const item = await Item.findOne({ _itemId: id });
      console.log(item);
      item.featureId.push({ _id: feature._id });
      console.log(item.featureId);
      await item.save();
      res.redirect("/admin/item/");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/item/");
    }
  },
  addItem: async (req, res) => {
    try {
      const { categoryId, title, price, city, about } = req.body;
      if (1 > 0) {
        const category = await Category.findOne({ _id: categoryId });
        const newItem = {
          categoryId,
          title,
          description: about,
          price,
          city,
        };
        const item = await Item.create(newItem);
        category.itemId.push({ _id: item._id });
        await category.save();
        for (let i = 0; i < 1; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          });
          item.imageId.push({ _id: imageSave._id });
          await item.save();
        }
        res.redirect("/admin/item");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/item/");
    }
  },
  showDetailBooking: async (req, res) => {
    const { id } = req.params;
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      const booking = await Booking.findOne({ _id: id })
        .populate("memberId")
        .populate("bankId");

      res.render("admin/booking/show_detail_booking", {
        title: "Staycation | Detail Booking",
        user: req.session.user,
        booking,
        alert,
      });
    } catch (error) {
      res.redirect("/admin/booking");
    }
  },
  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate("memberId")
        .populate("bankId");

      res.render("admin/booking/view_booking", {
        title: "Staycation | Booking",
        user: req.session.user,
        booking,
      });
    } catch (error) {
      res.redirect("/admin/booking");
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = "Accept";
      await booking.save();
      req.flash("alertMessage", "Success Confirmation Pembayaran");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },

  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = "Reject";
      await booking.save();
      req.flash("alertMessage", "Success Reject Pembayaran");
      req.flash("alertStatus", "success");
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },
};
