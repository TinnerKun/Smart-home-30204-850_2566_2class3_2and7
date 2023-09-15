const error = (message) => {
    console.log('\x1b[31m%s\x1b[0m', '[- Error -] ' + message);
    if (message instanceof Object) {
        console.log('\x1b[31m%s\x1b[0m', `[- Debug | ${new Date(Date.now())} -]`);
        console.log(message);
        console.log('\x1b[31m%s\x1b[0m', '[- Debug End -]');
    }
};

const success = (message) => {
    console.log('\x1b[32m%s\x1b[0m', '[+ Success +] ' + message);
};

const info = (message, arg) => {
    if (arg) {
        console.log('\x1b[34m%s\x1b[0m', `[* Info | ${arg} | ${new Date(Date.now())} *]`);
    } else {
        console.log('\x1b[34m%s\x1b[0m', `[* Info | ${new Date(Date.now())} *]`);
    }
    console.log(message);
    console.log('\x1b[34m%s\x1b[0m', '[* Info End *] ');
};

const warning = (message) => {
    console.log('\x1b[33m%s\x1b[0m', '[! Warning !] ' + message);
};

const question = (message) => {
    console.log('\x1b[37m%s\x1b[0m', '[? Question ?] ' + message);
};

const log = (message, status) => {
    switch (status) {
        case 'success':
            success(message);
            break;
        case 'error':
            error(message);
            break;
        case 'info':
            info(message);
            break;
        case 'warning':
            warning(message);
            break;
        default:
            question(message);
            break;
    }
};

const logger = {
    error,
    success,
    info,
    warning,
    question,
    log,
};

export default logger;