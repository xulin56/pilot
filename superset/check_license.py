from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import logging
import os
from jpype import *


class CheckLicense(object):
    default_jar = "/usr/local/lib/pilot-license.jar"

    @classmethod
    def start_jvm(cls, license_jar):
        jar = license_jar if license_jar else cls.default_jar
        if not isJVMStarted():
            if not os.path.exists(jar):
                logging.error("Can't find the jar for license checking: {}"
                              .format(jar))
                raise IOError
            startJVM(get_default_jvm_path(), '-ea', '-Djava.class.path={}'
                     .format(jar))

    @classmethod
    def shutdown_jvm(cls):
        shutdownJVM()

    @classmethod
    def check(cls, server_location, license_jar=None):
        cls.start_jvm(license_jar)
        try:
            Check = JClass('io.transwarp.pilot.license.CheckLicense')
            check = Check()
            check.checkLicense(server_location)
        except JavaException as ex:
            logging.error(ex.message())
            msg = "License check fialed with check server: {}".format(server_location)
            logging.error(msg)
            raise Exception(msg)
        finally:
            cls.shutdown_jvm()
            logging.info("License check succeed")
