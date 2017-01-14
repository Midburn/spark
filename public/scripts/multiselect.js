function MultiChoiceSelector(input, options){

  if (input == undefined && input.type != "text" && !Array.isArray(options.options) && options.options.length <= 0)
    throw new Error("Invalid arguments");

  var _input = input;
  var _options = options.options;
  var _shouldAddOther = options.shouldAddOther || false;
  var _currentValues = [];
  var _cboxes = [];
  var _container;
  var _otherCb;
  var _otherInput;
  var _cbFunc = options.onChange || null;

  var _cb_checked_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNvyMY98AAAJ4SURBVEhLvZbNaxNBGManFKGKp35oVPCjF7X05k0oeBBy8CJCPCkIYkFPPShqoQzdD8TUZHbjurNTK0G8RcGzN/GiHkqEIv4LooiCUEFt4zPbmXSbbM0u3c0LDyTP++77y0ze3R0yPXP7rekErX7q+s3ZZRKX6IfaYMPhpsEenbRr4kQekr0NJ5jrAsskQdjO4/10gU9kqrJXkL1p1R+PBUsoPq9qLzMx/qvs1QtmbfGY9raA5a/T33egVYCeWQ6/YbrissmCD9KnC/5kbmCD8S+240/KbZVxj/Gj8H7IXH5gbOd81Z9STEI9by/8ps7nAsaq1gG+ppikVGoMwn8erckJHCwpZhjwZjtr8gA3Ka0PKSax2GIRq//bWZctmAU/DeYfV0xiektH4H/rqoOyBK+bDr+qmITW60Pw3nfUtJUhmL8kpDWguAPw3O6aTWUCxhR/pg/EqIISg4nz4WTH1GrtGCwBRi24oJiEOuIwVv89rjaqNOA16A3eWq8iXstyREMxybQQuzBgr6P57ZQMjGmdZ35RNi81GoNY5aeNOv7Vdp+MhVSE4fK7+vpeSgQG6IXqHQYeELeUf0VZgPqncL/+1tf3UkJwsKL6h0F9fx/8p63WxhRTIfZgVz7qa5Mo6X+8ZlX4oZAaE9jysr4uqRIPl8WCGcXZEnjHno57JPZSYjBW9U6x2lGpVHZvDlo6JQaH9ysGSDHDwKnC1Pm0SrFiwB3exMnwklHlFy0mbHh/ovk0+j8Yp0F5ktBeZkJPev/hwW3BcjtxZCnYLp/IUlY1OBD2jjvenimemxseGRsfHhnNTVNni3e6wP0WwQAtxyVyFQtW/gGjEdvRYPpZAgAAAABJRU5ErkJggg==";
  var _cb_unchecked_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuNvyMY98AAADWSURBVEhLY0grKD/ePGHGf3rizJKqswzYJOiB4RY3TZje3NQ/VbN10kwNWmCQ2U0TZtRiWAySZACC1gmzxeu7p2tRFXdNkQCZXd83TQmrxSBLgexvMDGq4f7p37umzJdonjRLESaGYjHIdTA+tXF99zSdUYvBjFGLqY1HLR61eNRiquFRi0ctHrWYahi/xcDWIKhhBhOjGgaaWd85WQqnxeAm6JQpEq0Tp2tRE7f0zZDE2bx1cPeuFRIWVRISFqEZtnVxr8CwmN6YAdh1OYtNgqa4f8ZlAFpgjrgRZG2NAAAAAElFTkSuQmCC";

  function _appendTo(parent, children){
    children.forEach(function(child){
      parent.appendChild(child);
    })
  }

  function _create(type, id, classList){
    var el = document.createElement(type);
    if (id)
      el.id = id;
    if (classList)
      el.classList = classList;
    return el;
  }

  function _createCb(value, id, classList){
    var el = _create('img', id, classList);
    el.src = _cb_unchecked_img;
    el.dataset.checked = "false";
    el.dataset.value = value;
    return el;
  }

  function createCbsForOptions(){
    var cb;
    _options.forEach(function(option){
      cb = _createCb(option, '', []);
      cb.addEventListener('click', cbClick.bind(this))
      _cboxes.push(cb);
    })
  }

  function createContainer(){
    _container = _create('div','',['multi-select-container']);
    _input.parentNode.insertBefore(_container, _input.nextSibling);
  }createOtherCbAndInput

  function addCbsToContainer(){
    _cboxes.forEach(function(cbox){
      var el = _create('div','',['multi-select-option']),
          text = _create('span','',['multi-select-option-text']);
      text.innerHTML = cbox.dataset.value;
      _appendTo(el, [cbox,text]);
      _container.appendChild(el);
    })
  }

  function checkCb(el){
    el.dataset.checked = "true";
    el.src = _cb_checked_img;
  }

  function uncheckCb(el){
    el.dataset.checked = "false";
    el.src = _cb_unchecked_img;
  }

  function cbClick(ev){
    if (ev.target.dataset.checked == "false"){
      checkCb(ev.target);
    }
    else{
      uncheckCb(ev.target);
    }
    refreshInput();
  }

  function createOtherCbAndInput(){
    var otherCont = _create('div', '',['multi-select-option-other']),
        text = _create('span','',['multi-select-option-text']);
    _otherCb = _createCb('Other');
    _otherInput = _create('input', '' ,[]);
    _otherCb.addEventListener('click', cbClick.bind(this));
    _otherInput.addEventListener('keyup', cbClick.bind(this));
    text.innerHTML = "Other";
    _appendTo(otherCont, [ _otherCb, text, _otherInput ]);
    _appendTo(_container, [otherCont]);
  }

  function refreshInput(){
    var selectedOptions = [];
    _cboxes.forEach(function(cbox){
      if (cbox.dataset.checked == "true")
        selectedOptions.push(cbox.dataset.value);
    })

    if (_shouldAddOther && _otherCb.dataset.checked == "true"){
      selectedOptions.push(_otherInput.value);
    }
    _input.value = selectedOptions;
    if (_cbFunc != null)
      _cbFunc(selectedOptions);
  }

  function hideInput(){
    _input.style.display = 'none';
  }

  function render(){
    hideInput();
    createContainer();
    addCbsToContainer();
    if (_shouldAddOther)
      createOtherCbAndInput();
  }

  function init(){
    createCbsForOptions();
    render();
  }

  init();

}
