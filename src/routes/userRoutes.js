const express = require("express");
const router = express.Router();
const clientes = require("../db/db.js");
require("dotenv").config({ path: "./.env" });

const jwt = require("jsonwebtoken");

const PORT = process.env.PORT;
const SECRET = process.env.SECRET;
const USUARIO = process.env.USUARIO;
const PASS = process.env.PASS;

//5: diseñamos un middleware para verificar los token
function checkToken(req, res, next) {
  //5.1: obtenemos el token desde la solicitud
  const tokenreq = req.headers.authorization;

  //validamos que el token exista en la solicitud
  if (!tokenreq) {
    return res.status(401).send("esta solicitud no contiene un token");
  }
  //en este campo si se cumple el token
  jwt.verify(tokenreq, SECRET, (err, data) => {
    //si el valos del error esta lleno implica que por algun motivo
    // el proceso de verificacion del token no fue exitoso
    if (err) {
      return res.status(403).send('token invalido o expirado');
    }
    //si error no tiene error continua con data
    req.rol = data
    next();
  });
}

//1:  creamos un const con la informacion que tendra nuestro usuario y contraseña
//envuento en variables de entorno
const user = {
  user: process.env.USUARIO,
  pass: process.env.PASS,
  rol: "vendedor",
};
//2: creamos la ruta login para y traemos lo que esta en user
router.post("/login", (req, res) => {
  const userreq = req.body.user;
  const pass = req.body.pass;

  // 2.1: validar si los datos corresponden
  if (userreq === user.user && pass === user.pass) {
    //3: creamos el payload
    const payload = {
      rol: user.rol,
    };

    //4: invocamos la libreria para crear el token
    const token = jwt.sign(payload, SECRET);
    res.send({
      token,
    });
  } else {
    res.status(403).send("no autorizado");
  }
});

console.log("PORT:", PORT);
console.log("SECRET:", SECRET);
console.log("USUARIO:", USUARIO);
console.log("PASS:", PASS);

router.get("/task",checkToken, (req, res) => {
  res.json(clientes);
});

router.post("/add", (req, res) => {
  try {
    const newTask = req.body;

    if (!newTask.task || !newTask.description) {
      throw new Error("tarea o descripcion son requeridas");
    }
    newTask.id = (clientes.length + 1).toString();
    clientes.push(newTask);
    res.status(200).send("tarea agregada exitosamente");
  } catch (error) {
    console.error("error al agregar la tarea", error);
    res.status(500).send("hubo un arror agregando la tarea");
  }
});

router.delete("/delete/:taskId", (req, res) => {
  try {
    const taskId = req.params.taskId;

    const taskIndex = clientes.find((task) => task.id === taskId);
    if (taskIndex === -1) {
      res.status(404).send("no se encontro ninguna tarea con el id");
    }
    clientes.splice(taskIndex, 1);
    res.status(200).send("tarea eliminada satisfactoriamente");
  } catch (error) {
    console.error("error al eliminar la tarea", error);
    res.status(404).send("hubo un error eliminando la tarea");
  }
});

module.exports = router;
