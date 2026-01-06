import Logo from '@/assets/images/logo.png';

function Brand() {
  return (<>
    <img
      src={Logo}
      alt="Brand logo"
      loading="eager"
      decoding="async"
    />
    <h1>কৃষক এরিয়া</h1>
  </>);
}

export default Brand;
