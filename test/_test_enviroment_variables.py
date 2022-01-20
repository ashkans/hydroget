# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from config import settings
from pathlib import Path

from unittest import TestCase

class TestEnviromentVariables(TestCase):
    """DevelopersController integration test stubs"""

    def test_if_base_path_is_readed_correctly(self):
        """Test case to test that base path is loaded correctly

        config setting basepath
        """
        message = 'BASEPATH is not set correctly.'
        self.assertNotEqual(settings.BASEPATH, Path('.'), message)



if __name__ == '__main__':
    import unittest
    unittest.main()
