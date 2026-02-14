const admin = require("firebase-admin");

const serviceAccount = require("./firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.auth().setCustomUserClaims("TF7INnB5J8cTcChuMTb1s999WNQ2", {
  admin: true,
})
.then(() => {
  console.log("Admin claim set successfully.");
  process.exit(0);
})
.catch((error) => {
  console.error("Error setting admin claim:", error);
  process.exit(1);
});
