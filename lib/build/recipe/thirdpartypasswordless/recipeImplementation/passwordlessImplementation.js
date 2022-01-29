"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getImpl(oI) {
    return {
        clearLoginAttemptInfo: oI.clearLoginAttemptInfo.bind(oI),
        consumeCode: oI.consumeCode.bind(oI),
        createCode: oI.createCode.bind(oI),
        doesEmailExist: oI.doesPasswordlessUserEmailExist.bind(oI),
        doesPhoneNumberExist: oI.doesPasswordlessUserPhoneNumberExist.bind(oI),
        getLoginAttemptInfo: oI.getLoginAttemptInfo.bind(oI),
        resendCode: oI.resendCode.bind(oI),
        setLoginAttemptInfo: oI.setLoginAttemptInfo.bind(oI),
    };
}
exports.default = getImpl;