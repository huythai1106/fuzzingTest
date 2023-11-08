import { configure, getLogger } from "log4js";

configure({
    "appenders": {
        "app": {
            "type": "console",
            
        }
    },
    "categories": {
        "default": {
            "appenders": ["app"],
            "level": "debug"
        }
    }
})

const logger = getLogger();
export default logger