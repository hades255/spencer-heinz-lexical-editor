// import crypto from 'crypto';
import base64url from 'base64url';

export const invitationEmailToUser = (from, to, doc, address = '') => {
  return to.status === 'invited'
    ? `${address}/invite/${generateSecretString(from._id, to._id, doc._id)}`
    : `${address}/document/${doc._id}?email=${to.email}`;
};

// const key = 'passwordpasswordpasswordpassword';
// const algorithm = 'aes-256-cbc';

export const generateSecretString = (from, to, doc, expired = 30) => {
  const x = base64url(
    JSON.stringify({ f: from, t: to, d: doc, x: expired === 100 ? 0 : new Date().getTime() + expired * 24 * 3600 * 1000 })
  );
  return x;
};

// const hash = crypto.createHash('sha256').update(secretString).digest('hex');
// return hash;

// export const decrypt = (text) => {
//   const iv = crypto.randomBytes(16);
//   const decipher = crypto.createDecipheriv(algorithm, key, iv);
//   let decryptedData = decipher.update(text, 'hex', 'utf8');
//   console.log(decryptedData);
//   decryptedData += decipher.final('utf8');
//   console.log(decryptedData);
//   return decryptedData;
// };

// export const encrypt = (text) => {
//   console.log(text);
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   let encryptedData = cipher.update(text, 'utf8', 'hex');
//   console.log(encryptedData);
//   encryptedData += cipher.final('hex');
//   console.log(encryptedData);
//   console.log(decrypt(encryptedData));
//   return encryptedData;
// };

/*

  return `<div style="display: flex; justify-content: center">
    <div
      style="
        width: 100%;
        max-width: 600px;
        border: 2px solid #1677ff;
        padding: 12px;
        border-radius: 20px;
        background-color: lightblue;
      "
    >
      <h4 style="text-align: center">
        <a
          title="${from.email}"
          href="mailto:${from.email}"
          style="text-decoration: none"
          >${from.name}</a
        >
        invited you to document.
      </h4>
      <hr style="border: 1px solid #1677ff; border-radius: 1px" />
      <p><b>Title:</b> ${doc.name}</p>
      <p>
        <b>Description: </b> ${doc.description}
      </p>
      <hr style="border: 1px solid #1677ff; border-radius: 1px" />
      <br />
      <div style="display: flex; justify-content: center">
        <div>
          Click
          <a
            href="${
              to.status === 'invited'
                ? `${address}/invite/${generateSecretString(from.email, to.email, doc._id)}`
                : `${address}/document/${doc._id}?email=${to.email}`
            }"
            style="
              padding: 8px;
              background-color: #1677ff;
              color: white;
              border-radius: 8px;
              text-decoration: none;
            "
            target="_blank"
            >HERE</a
          >
          to contribute!
        </div>
      </div>
    </div>
  </div>`;
  */
