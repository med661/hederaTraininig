const {
  Client,
  TopicCreateTransaction,
  TopicUpdateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  PrivateKey,
  Hbar
} = require("@hashgraph/sdk");
require('dotenv').config();

async function main() {
  const myAccountId = process.env.ACCOUNT_ID;
  const myPrivateKey = process.env.PRIVATE_KEY;

 
  const client = Client.forTestnet()
  client.setOperator(myAccountId, myPrivateKey);

  const adminKey = PrivateKey.generate();
  const submitKey = PrivateKey.generate();
  
  let transaction = await new TopicCreateTransaction()
  .setAdminKey(adminKey)
  .setSubmitKey(submitKey)
  .setTopicMemo("new topic")
  .freezeWith(client);
  
  const sign1 = await transaction.sign(adminKey);
  const sign2= await sign1.sign(submitKey);
  const txId = await sign2.execute(client);

  const receipt = await txId.getReceipt(client);
  const topicId = receipt.topicId;
  console.log(topicId);

   // Query the topic info 
   const topicInfo = await new TopicInfoQuery()
   .setTopicId(topicId)
   .execute(client);
   
   console.log("Topic Memo:", topicInfo.topicMemo);


  // Update the topic memo
  let updateTransaction= await new TopicUpdateTransaction()
      .setTopicId(topicId)
      .setTopicMemo("update topic")
      .freezeWith(client);
  
  const sign3 = await updateTransaction.sign(adminKey);
  const sign4= await sign3.sign(submitKey);
  const topicInfo2 = await new TopicInfoQuery()
      .setTopicId(topicId)
      .execute(client);

  console.log("Updated Topic Info:");
  console.log(topicInfo2.topicMemo);

  const messageTransactionId = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage("submited successfully done")
      .execute(client);

  console.log("ID ta:", messageTransactionId);
  console.log("published");
}

main().catch((err) => {
  console.error(err);
});