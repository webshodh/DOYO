
function createAccount(initialBalance) {
  let balance = initialBalance; // Private Varibale
  return {
    deposit: function (amount) {
      if (amount > 0) {
        balance += amount;
      }
    },
    withdraw: function (amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
      }
    },
    getBalance: function () {
      return balance;
    },
  };
}

const myAccount = createAccount(100);

myAccount.deposit(50)
console.log(myAccount.getBalance()); // Output : 150

myAccount.withdraw(30)
console.log(myAccount.getBalance()); // Output : 120



