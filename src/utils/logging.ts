export const log = (message: string) => {
  if (process.env.REACT_APP_LOGGING_ENABLED) {
    console.log(message);
  }
};
