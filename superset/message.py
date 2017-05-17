from flask_babel import gettext as __


ALL_DATASOURCE_ACCESS_ERR = __(
    "This endpoint requires the `all_datasource_access` permission")
DATASOURCE_MISSING_ERR = __("The datasource seems to have been deleted")
ACCESS_REQUEST_MISSING_ERR = __(
    "The access requests seem to have been deleted")
USER_MISSING_ERR = __("The user seems to have been deleted")
DATASOURCE_ACCESS_ERR = __("You don't have access to this datasource")
OBJECT_NOT_FOUND = __("Not found this object")

ONLINE_SUCCESS = __("Change to online success")
OFFLINE_SUCCESS = __("Change to offline success")
OBJECT_IS_ONLINE = __("This object is already online")
OBJECT_IS_OFFLINE = __("This object is already offline")

ERROR_URL = __("Error request url")
ERROR_REQUEST_PARAM = __("Error request parameter")
ERROR_CLASS_TYPE = __("Error model type")
NO_USER = __("Can't get user")
NO_PERMISSION = __("No permission for 'online' and 'offline'")

ADD_SUCCESS = __("Added success")
ADD_FAILED = __("Added failed")
UPDATE_SUCCESS = __("Updated success")
UPDATE_FAILED = __("Updated failed")
DELETE_SUCCESS = __("Deleted success")
DELETE_FAILED = __("Deleted failed")
