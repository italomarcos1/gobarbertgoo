import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      // configuração do schema de validação
      name: Yup.string().required(), // string obrigatória
      email: Yup.string() // email obrigatório
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6), // mínimo de 6 caracteres
    });

    if (!(await schema.isValid(req.body))) {
      // joga o corpo da requisição no schema pra testar se os dados são válidos
      return res.status(400).json({ error: 'Validation fails pow.' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'porra cleiton poe outro email' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, oldPassword } = req.body; // recebe email e senha atual da body.

    const user = await User.findByPk(req.userId); // busca o user do banco usando a id. busca pela chave primária

    if (email !== user.email) {
      // se o email for informado e eh diferente do atual, o usuario quer mudar. se ja nao existir, pode efetuar a alteração.
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      // checa se o usuario quer alterar a senha (se for informada) e se bate com a antiga
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await user.update(req.body); // atualiza o usuario e retorna as infos pro front-end

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      // retorna as informações pro back-end
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
