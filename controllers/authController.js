import joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

import db from '../config/db.js';

export default async function postRegister(req, res) {
    const user = req.body;
    const checkedCPF = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$/;
    let cpfOk = checkedCPF.test(user.cpf);

    const authSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        cpf: joi.string().required(),
        password: joi.string().min(8).required(),
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
       
    });

    const validation = authSchema.validate(user, { abortEarly: false});
    
    if (!cpfOk) {
        return res.sendStatus(422).send("CPF inválido, por favor digite um cpf no formato xxx.xxx.xxx-xx");
    }
    if (validation.error ) {
        return res.status(422).send(validation.error.details.map((e) => e.message));
    }

    try {
        //testar se já existe email
        const existEmail = await db.collection('users').findOne({ email: user.email });

        if (existEmail) {
            return res.sendStatus(409);
        }
        let bcryptPassword = bcrypt.hashSync(user.password, 10);
        await db.collection("users").insertOne({ name: user.name, email: user.email, cpf:user.cpf, password: bcryptPassword, cart:[]});
        return res.sendStatus(201);
    } catch (error) {
        return res.sendStatus(500);
    }

}

export function postLogin(_req, res) {
  const { name, email, cpf } = res.locals.user;

  const data = { name, email, cpf };
  const secretKey = process.env.JWT_SECRET;

  const TIME_30M = 30*60;
  const token = jwt.sign(data, secretKey,{ expiresIn: TIME_30M });

  const response = {
    name,
    email,
    cpf,
    token: token,
  };

  return res.status(201).send(response);
}
