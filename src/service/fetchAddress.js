const PinValidator = async (pin) => {
  let Blocks = []
  let State = ""
  let Street = []
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await response.json();
    if (data[0].Status === "Success") {
      let PostOffice = data[0].PostOffice
      State = PostOffice[0].State
      for (let i = 0; i < PostOffice.length; i++) {
        Blocks.push(PostOffice[i].Block)
        Street.push(PostOffice[i].Name)
      }
      
      Blocks = [...new Set(Blocks)]
      Street = [...new Set(Street)]
      return {Blocks: Blocks, Street: Street, State: State}
    }else if(data[0].Status === "Error"){
      return {message: "Invalid Pin"}
    }
  } catch (err) {
    console.log(err);
  }
};


export default PinValidator
