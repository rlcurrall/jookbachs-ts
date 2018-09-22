/**
 * Factory for the JbAdmin class that injects all necessary dependencies.
 *
 * @param {object} deps
 * @returns
 */
function webUIFactory (deps) {

    // #region Dependency Setup
    if (!deps.JbRouter) {
		throw new Error('[ JbAdmin ] Missing Dependency: express is config are required');
	}

    const JbRouter = deps.JbRouter;
    // #endregion

    /**
     * Concrete implementation of the JbRouter class defining the / route.
     *
     * @class JbAdmin
     * @extends {JbRouter}
     */
    class JbAdmin extends JbRouter {

        /**
         * Creates an instance of JbAdmin.
         * @constructor
         *
         * @param {Object} expressRouter
         * @param {Object} [options]
         * @memberof JbAdmin
         */
        constructor (JbExpress, options) {
            super(JbExpress, options);
            this.publicPath = `${this.config.rootDir}/admin/`;
			this.url = '/admin'

            this.assignRoute();
        }

        /**
         * Defines all responses for the JbAdmin router.
         *
         * @param {Object} router
         * @memberof JbAdmin
         */
        assignRoute() {
            let that = this;
            this.JbExpress.setStatic(that.url, that.publicPath);

            // let router = this.expressRouter;

            // router.use(express.static(this.publicPath));
            this.log('Route Created', 'info', 'JbAdmin');
        }
    }

    return JbAdmin;
}

module.exports = webUIFactory;
