const deviceSizes = {
  mobile: '500px',
  smallTablet: '900px',
  tablet: '1700px',
  laptop: '2000px',
};

const device = {
  mobile: `screen and (max-width: ${deviceSizes.mobile})`,
  smallTablet: `screen and (max-width: ${deviceSizes.smallTablet})`,
  tablet: `screen and (max-width: ${deviceSizes.tablet})`,
  laptop: `screen and (max-width: ${deviceSizes.laptop})`,
};

const theme = {
  device,
};

export default theme;
