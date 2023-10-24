export const TruncatedText = (text, length = 50) => {
  if (text.length <= length) {
    return <span>{text}</span>;
  } else {
    const truncatedText = text.slice(0, length) + '...';
    return <span>{truncatedText}</span>;
  }
};
