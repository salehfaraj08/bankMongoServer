const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const mongoose = require('mongoose');
const bankModel = require('./models/bank.model').bankUser;

app.get('/', async (req, res) => {
    const data = await bankModel.find({});
    return res.status(200).send(data);
});
///get customer by id
app.get('/getCustomer/:passportid', async (req, res) => {
    const { passportid } = req.params;
    bankModel.find({ passportId: { $eq: passportid } }, (err, data) => {
        if (err)
            throw err;
        if (data && data.length > 0)
            return res.status(200).send(data);
        return res.status(404).send({ error: 'these customer is not exist' });
    });
});

app.post('/', async (req, res) => {
    const { passportId, name } = req.body, cash = 0, credit = 0;
    const user = new bankModel({
        passportId,
        name,
        cash,
        credit
    });
    const data = await bankModel.find({});
    const customer = data.find(customer => customer.passportId === passportId);
    console.log(customer);
    if (customer) {
        return res.status(400).json({ error: 'Customer is already exist' });
    }
    user.save((err, data) => {
        if (err) return res.status(404).send(err);
        return res.status(200).send(data);
    });
});

app.put('/bank/deposit/:id', async (req, res) => {
    const { id } = req.params;
    const amountOfCash = parseInt(req.body.amountOfCash);
    console.log('amount', amountOfCash);
    if (amountOfCash > 0) {
        bankModel.findById(id, (err, user) => {
            if (err) return res.status(404).send(err);
            bankModel.findByIdAndUpdate(id, { cash: user.cash + amountOfCash }, { new: true, runValidators: true }, (err, data) => {
                if (err) return res.status(404).send(err);
                return res.status(200).send(user);
            });
        });

    }
    else {
        return res.status(400).json({ error: 'cannot update a negative number to credit' })
    }
});

app.put('/bank/updateCredit/:id', async (req, res) => {
    const { id } = req.params;
    const newCredit = parseInt(req.body.newCredit);
    if (newCredit > 0) {
        bankModel.findById(id, (err, user) => {
            if (err) return res.status(404).send(err);
            bankModel.findByIdAndUpdate(id, { credit: user.credit + newCredit }, { new: true, runValidators: true }, (err, data) => {
                if (err) return res.status(404).send(err);
                return res.status(200).send(user);
            });
        });
    }
    else {
        return res.status(400).json({ error: 'cannot update a negative number to credit' })
    }
});

app.put('/bank/withdraw/:id', async (req, res) => {
    const { id } = req.params;
    const withdrawAmount = parseInt(req.body.withdrawAmount);
    bankModel.findById(id, (err, user) => {
        if (err) return res.status(404).send(err);
        if (withdrawAmount <= user.cash && withdrawAmount > 0) {
            bankModel.findByIdAndUpdate(id, { cash: user.cash - withdrawAmount }, { new: true, runValidators: true }, (err, data) => {
                if (err) return res.status(404).send(err);
                return res.status(200).send(user);
            });
        }
        else if (user.cash + user.credit >= withdrawAmount && withdrawAmount > 0) {
            bankModel.findByIdAndUpdate(id, { cash: user.cash - withdrawAmount }, { new: true, runValidators: true }, (err, data) => {
                if (err) return res.status(404).send(err);
                return res.status(200).send(user);
            });
        }
        else {
            return res.status(400).json({ error: 'cannot withdraw there is no enough money/credit' })
        }
    });
});

////tranfer from customer to another
app.put('/bank/transfer/:id/:recieverId', async (req, res) => {
    const { id, recieverId } = req.params;
    const transferAmount = parseInt(req.body.transferAmount);
    console.log(id,recieverId,transferAmount);
    bankModel.findById(id, (err, customer) => {
        if (err) return res.status(404).send(err);
        bankModel.findById(recieverId, (err, reciever) => {
            if (err) return res.status(404).send(err);
            if (customer.passportId === reciever.passportId) {
                return res.status(400).json({ error: 'cannot transfer from customer to the same customer' })
            }
            if (transferAmount <= customer.cash && transferAmount > 0) {
                bankModel.findByIdAndUpdate(id, { cash: customer.cash - transferAmount }, { new: true, runValidators: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    bankModel.findByIdAndUpdate(recieverId, { cash: reciever.cash + transferAmount }, { new: true, runValidators: true }, (err, data) => {
                        if (err) return res.status(404).send(err);
                    });
                    return res.status(200).send(customer);
                });
                
            }
            else if (customer.cash + customer.credit >= transferAmount && transferAmount > 0) {
                bankModel.findByIdAndUpdate(id, { cash: customer.cash - transferAmount }, { new: true, runValidators: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    bankModel.findByIdAndUpdate(recieverId, { cash: reciever.cash + transferAmount }, { new: true, runValidators: true }, (err, data) => {
                        if (err) return res.status(404).send(err);
                    });
                    return res.status(200).send(customer);
                });
                
            }
            else {
                return res.status(400).json({ error: 'cannot tranfer there is no enough money/credit' })
            }
        });
    });
});

mongoose.connect('mongodb+srv://saleh:saleh0811@cluster0.whijz.mongodb.net/bankDb?retryWrites=true&w=majority', { useNewUrlParser: true }, () => {
    console.log('connected to db');
});

app.listen(process.env.PORT || 5001, () => {
    console.log('listening on server 5001 or env');
});