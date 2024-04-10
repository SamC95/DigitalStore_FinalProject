// Loading style adapted from https://blog.hubspot.com/website/css-loading-animation 

import '../Styles/Loading.css';

const LoadingBar = () => {
  return (
    <div className='center'>
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
      <div className="wave" />
    </div>
  );
};

export default LoadingBar;