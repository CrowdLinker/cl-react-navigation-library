module.exports = {
  presets:
    process.env.NODE_ENV === 'test'
      ? ['module:metro-react-native-babel-preset']
      : [],
};
