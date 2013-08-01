function ClearOptions(OptionList) {

   // Always clear an option list from the last entry to the first
   for (x = OptionList.length; x >= 0; x--) {
      OptionList[x] = null;
   }
}


function AddToOptionList(OptionList, OptionValue, OptionText) {
   // Add option to the bottom of the list
   OptionList[OptionList.length] = new Option(OptionText, OptionValue);
}
