import connexion
import six

from swagger_server.models.inventory_item import InventoryItem  # noqa: E501
from swagger_server import util


def add_inventory(body=None):  # noqa: E501
    """adds an inventory item

    Adds an item to the system # noqa: E501

    :param body: Inventory item to add
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = InventoryItem.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
