class Mail {
  constructor(from, subject, content) {
    this.from = from;
    this.subject = subject;
    this.content = content;
  }
}

const mailArray = [];
mailArray.push(new Mail('Johnny', 'Test Mail 1', 'this email is for testing'));
mailArray.push(new Mail('Mary', 'Test Mail 2', 'this email is for testing 2'));
mailArray.push(new Mail('Tom', 'Test Mail 3', 'this email is for testing 3'));
mailArray.push(new Mail('Kelly', 'Test Mail 4', 'this email is for testing 4'));

exports.handler = async function handle() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      mailBlock: mailArray,
    }),
  };
};
