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
        return res.status(404).send({ error: 'there is no book published on this year' });
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
    user.save((err, data) => {
        if (err) return res.status(404).send(err.message);
        return res.status(200).send(data);
    });
});

app.put('/bank/deposit/:id', async (req, res) => {
    const { id } = req.params;
    const { amountOfCash } = parseInt(req.body.amountOfCash);
    const user = {
        
    };
    bookModel.findByIdAndUpdate(updateId, book, { new: true, runValidators: true }, (err, data) => {
        if (err) return res.status(404).send(err.message);
        return res.status(200).send(data);
    });



    let customer = file.customers.find(customer => customer.id === parseInt(id));
    if (!customer) {
        return res.status(400).json({ error: 'customer is not exist' })
    }
    if (amountOfCash > 0) {
        customer.cash += amountOfCash
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'cash updated successfully' });
    }
    else {
        return res.status(400).json({ error: 'cannot deposit a negative number' })
    }
});

app.put('/bank/updateCredit/:id', async (req, res) => {
    const { id } = req.params;
    const newCredit = parseInt(req.body.newCredit);
    let file = await getAllCustomers();
    let customer = file.customers.find(customer => customer.id === parseInt(id));
    if (!customer) {
        return res.status(400).json({ error: 'customer is not exist' })
    }
    if (newCredit > 0) {
        customer.credit += newCredit
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'credit updated successfully' });
    }
    else {
        return res.status(400).json({ error: 'cannot update a negative number to credit' })
    }
});

app.put('/bank/withdraw/:id', async (req, res) => {
    const { id } = req.params;
    const withdrawAmount = parseInt(req.body.withdrawAmount);
    let file = await getAllCustomers();
    let customer = file.customers.find(customer => customer.id === parseInt(id));
    if (!customer) {
        return res.status(400).json({ error: 'customer is not exist' })
    }
    if (withdrawAmount <= customer.cash && withdrawAmount > 0) {
        customer.cash -= withdrawAmount;
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'withdraw money successfully' });
    }
    else if (customer.cash + customer.credit >= withdrawAmount && withdrawAmount > 0) {
        customer.cash -= withdrawAmount;
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'withdraw money successfully' });
    }
    else {
        return res.status(400).json({ error: 'cannot withdraw there is no enough money/credit' })
    }
});

////tranfer from customer to another
app.put('/bank/transfer/:id/:recieverId', async (req, res) => {
    const { id, recieverId } = req.params;
    const transferAmount = parseInt(req.body.transferAmount);
    let file = await getAllCustomers();
    let customer = file.customers.find(customer => customer.id === parseInt(id));
    let reciever = file.customers.find(customer => customer.id === parseInt(recieverId));
    if (!customer || !reciever) {
        return res.status(400).json({ error: 'customer is not exist' })
    }
    if(customer.passportId===reciever.passportId){
        return res.status(400).json({ error: 'cannot transfer from customer to the same customer' })
    }
    if (transferAmount <= customer.cash && transferAmount > 0) {
        customer.cash -= transferAmount;
        reciever.cash += transferAmount;
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'tranfered money successfully' });
    }
    else if (customer.cash + customer.credit >= transferAmount && transferAmount > 0) {
        customer.cash -= transferAmount;
        reciever.cash += transferAmount;
        fs.writeFile('Customers.json', JSON.stringify(file), (err) => {
            if (err) {
                console.log(err);
            }
        })
        return res.status(200).json({ success: 'tranfered money successfully' });
    }
    else {
        return res.status(400).json({ error: 'cannot tranfer there is no enough money/credit' })
    }
});

mongoose.connect('mongodb+srv://saleh:saleh0811@cluster0.whijz.mongodb.net/bankDb?retryWrites=true&w=majority', { useNewUrlParser: true },()=>{
    console.log('connected to db');
});

app.listen(process.env.PORT || 5001,()=>{
    console.log('listening on server 5001 or env');
});