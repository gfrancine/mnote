// some external packages somehow try to
// access node globals

export default (() => {
  window.process = {
    env: {}
  };
})();