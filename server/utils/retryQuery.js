async function retryQuery(queryFn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (err) {
      console.log(`Retry attempt ${i + 1}`);

      if (i === retries - 1) {
        throw err;
      }

      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

module.exports = retryQuery;