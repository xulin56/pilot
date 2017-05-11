"""create index

Revision ID: 0002
Revises: 0001
Create Date: 2017-05-10 10:26:56.139842

"""

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'

from alembic import op


def upgrade():
    op.create_index('index_dashboards', 'dashboards', ['online'])
    op.create_index('index_slices', 'slices', ['online'])
    op.create_index('index_daily_number', 'daily_number', ['obj_type'])
    op.create_index('index_favstar', 'favstar', ['class_name'])
    op.create_index('index_logs', 'logs', ['action_type'])


def downgrade():
    op.drop_index('index_dashboards', 'dashboards')
    op.drop_index('index_slices', 'slices')
    op.drop_index('index_daily_number', 'daily_number')
    op.drop_index('index_favstar', 'favstar')
    op.drop_index('index_logs', 'logs')
