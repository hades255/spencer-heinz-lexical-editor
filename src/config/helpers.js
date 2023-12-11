// import crypto from 'crypto';

export const invitationEmailToUser = (from, to, doc, address = '') => {
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
            href="${address}/document/${doc._id}?email=${to.email}"
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
};

// export const generateSecretString = (...val) => {
//   const secretString = JSON.toString({ ...val });
//   const hash = crypto.createHash('sha256').update(secretString).digest('hex');
//   return hash;
// };

/**
 * 
 * ${
              to.status === 'invited'
                ? `${address}/invites/${generateSecretString(from.email, to.email, doc._id)}`
                : `${address}/document/${doc._id}?email=${to.email}`
            }
 * 
 */
