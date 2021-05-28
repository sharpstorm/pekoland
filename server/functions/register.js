exports.handler = async function(event, context) {
  return {
    statusCode: 404,
    body: JSON.stringify ({message: 'Not Available'})
  };
}