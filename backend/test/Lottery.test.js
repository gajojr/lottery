const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multipe accounts to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('1', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async() => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('there are 3 winners', async() => {
        for (let i = 1; i < 10; i++) {
            await lottery.methods.enter().send({
                from: accounts[i],
                value: web3.utils.toWei('15', 'ether')
            });
        }

        const winners = await lottery.methods.pickWinner().call({
            from: accounts[0]
        });

        assert.equal(3, winners.length);
    });

    it('can not choose winner if balance is less than 100 ether', async() => {
        try {
            for (let i = 0; i < 10; i++) {
                await lottery.methods.enter().send({
                    from: accounts[i],
                    value: web3.utils.toWei('2', 'ether')
                });
            }

            await lottery.methods.pickWinner().call({
                from: accounts[0]
            });

            assert(false);
        } catch (err) {
            assert(err);
        }
    });
});